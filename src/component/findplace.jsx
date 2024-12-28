import { useState, useRef, useEffect } from 'react';
import findBoundaryByName from './lib/findBoundByName';
import LoadingIcon from './LoadingIcon';
import appState from './lib/appState';
import queryState from './lib/appState';
import LoadOptions from './lib/loadOptions';
import Progress from './lib/progress';
import '../styles/findplace.css'
import Query from './lib/Query';


function FindPlace({ onLoaded }) {
    const [enteredInput, setEnteredInput] = useState('');
    const [boxInTheMiddle, setBoxInTheMiddle] = useState(true);
    const [loading, setLoading] = useState(null);
    const [hideInput, setHideInput] = useState(false);
    const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [noRoads, setNoRoads] = useState(false);
    const [lastSuggestion, setLastSuggestion] = useState(null);
    const [stillLoading, setStillLoading] = useState(0);
    const inputRef = useRef(null);
    let notifyStillLoading = useRef(null);
    let progressToken = null;

    useEffect(()=>{
        inputRef.current.focus();
    }, [])
    
    const handleSubmit = () => {
        setNoRoads(false)
        setLoading('Searching cities tha match your query...')
        findBoundaryByName(enteredInput)
            .then(suggestions => {
                setLoading(null);
                setHideInput(suggestions && suggestions.length);
                if(boxInTheMiddle){
                    setBoxInTheMiddle(false);
                    setTimeout(() => {
                        setSuggestionsLoaded(true);
                        setSuggestions(suggestions);
                    }, 50)
                }else{
                    setSuggestionsLoaded(true);
                    setSuggestions(suggestions);
                }   
            })
    }

    const retry = () => {
        if(lastSuggestion){
            pickSuggestion(lastSuggestion);
        }
    }

    const getBugReportURL = () => {
        let title = encodeURIComponent('OSM Error')
        let body = ''
        if(error){
            body = 'Hello, an error occurred on he website: \n\n ```\n' +
                error.toString() + '\n ```\n\n Can you please help?';
        }

        return `https://github.com/tangsiwei0831/city-road/issues/new?title=${title}&body=${encodeURIComponent(body)}`
    }

    const restartLoadingMonitor = () => {
        clearInterval(notifyStillLoading);
        setStillLoading(0);
        notifyStillLoading = setInterval(() => {
            setStillLoading(prev => prev + 1)
        }, 10000)
    }

    const pickSuggestion = (suggestion) => {
        setLastSuggestion(suggestion);
        setError(false);
        UseOSM(suggestion);
    }

    const UseOSM = (suggestion) => {
        setLoading('Connecting to OpenStreetMap...');
        restartLoadingMonitor();
        Query.runFromOptions(new LoadOptions({
            wayFilter: Query.Road,
            areaId: suggestion.areaId,
            bbox: suggestion.bbox
        }), generateNewProgressToken())
        .then(grid => {
            setLoading(null);
            if (!grid.hasRoads()) {
              setNoRoads(true);
            } else {
              grid.setName(suggestion.name);
              grid.setId(suggestion.areaId || suggestion.osm_id);
              grid.setIsArea(suggestion.areaId); // osm nodes don't have area.
              grid.setBBox(serializeBBox(suggestion.bbox));
              onLoaded(grid);
            }
          }).catch(err => {
            if (err.cancelled) {
                setLoading(null);
                return;
            }
            console.error(err);
            setError(err);
            setLoading(null);
            setSuggestions([]);
          })
          .finally(() => {
            clearInterval(notifyStillLoading);
            setStillLoading(0);
          });
    }

    const updateProgress = (status) => {
        setStillLoading(0);
        clearInterval(notifyStillLoading);
        if(status.loaded < 0){
            setLoading('Trying a different server');
            restartLoadingMonitor();
            return;
        }
        if (status.percent !== undefined) {
             setLoading('Loaded ' + Math.round(100 * status.percent) + '% (' + formatNumber(status.loaded) + ' bytes)...');
        }else {
            setLoading('Loaded ' + formatNumber(status.loaded) + ' bytes...');
        }
    }

    const generateNewProgressToken = () => {
        if(progressToken){
            progressToken.cancel();
            progressToken = null;
        }
        progressToken = new Progress(updateProgress);
        return progressToken;
    }

    return (
    <div className={`find-place ${boxInTheMiddle ? 'centered' : ''}`}>
        {boxInTheMiddle && (<>
            <h3 className='site-header'>city roads</h3>
            <p className='description'>This website renders every single road within a city</p>
        </>)}
        <form className='search-box' onSubmit={(e) => {e.preventDefault(); handleSubmit();}}>
            <input 
                type='text' 
                className='query-input'
                placeholder='Ener a city name to start' 
                value={enteredInput}
                onChange={(e) => setEnteredInput(e.target.value)}
                ref={inputRef}>
            </input>
            {enteredInput && !hideInput && (
            <a
                type='submit'
                className='search-submit'
                href='#'
                onClick={handleSubmit}>
                Find City Bounds
            </a>)}
        </form>
        <div className='results'>
            {suggestionsLoaded && suggestions.length > 0 && (
                <div className='suggestions shadow'>
                    <div className='prompt messsage'> 
                        <div>Select boundries below to download all roads within</div>
                        <div className='note'>large cities may require 200MB+ of data transfer and a pwoerful device</div>
                    </div>
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>
                                <a
                                    onClick={(e) =>{e.preventDefault(); pickSuggestion(suggestion);}}
                                    className='suggestion'
                                    href = '#'
                                >
                                    <span>
                                        {suggestion.name} <small>({suggestion.type})</small>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {suggestionsLoaded && suggestions.length === 0 && !loading && !error && (
                <div className='no-results message shadow'> 
                    Didn&apos;t find matching cities. Try a different query?
                </div>
            )}
            {noRoads && (
                <div className='no-results message shadow'> 
                    Didn&apos;t find any roads. Try a different query?
                </div>
            )}
        </div>
        {error && (
            <div className='error message below'>
                <div>
                Sorry, we were not able to download data from the OpenStreetMap.
                It could be very busy at the moment processing other requests. <br/><br/> Please bookmark this website and <a href='#' onClick={(e)=>{e.preventDefault(); retry();}}>try again</a> later?
                </div>
                <div className='error-links'>
                    <a href='https://twitter.com/anvaka/status/1218971717734789120' title='see what it supposed to do' target="_blank">see how it should have worked</a>
                    <a href={getBugReportURL(error)} title={`report error:  + {error}`} target='_blank'>report this bug</a>
                </div>
            </div>
        )}
        {loading && (
            <div className='loading message shadow'>
                <LoadingIcon />
                <span>{loading}</span>
                {stillLoading > 0 && (<div className='load-padding'>
                    Still loading ...
                </div>)}
                {stillLoading > 1 && (<div className='load-padding'>
                    Sorry it takes so long!
                </div>)}
            </div>
        )}
    </div>
    )
}


function formatNumber(x) {
    if (!Number.isFinite(x)) return 'N/A';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
  
function serializeBBox(bbox) {
    return bbox && bbox.join(',');
}
  
export default FindPlace;