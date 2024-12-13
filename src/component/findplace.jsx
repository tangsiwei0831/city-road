/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import findBoundaryByName from './lib/findBoundByName';
import LoadingIcon from './LoadingIcon';
import '../styles/findplace.css'

function FindPlace() {
    const [enteredInput, setEnteredInput] = useState('');
    const [boxInTheMiddle, setBoxInTheMiddle] = useState(true);
    const [loading, setLoading] = useState(null);
    const [hideInput, setHideInput] = useState(false);
    const inputRef = useRef(null);

    useEffect(()=>{
        inputRef.current.focus();
    }, [])
    
    const handleSubmit = () => {
        setLoading('Searching cities tha match your query...')
        findBoundaryByName(enteredInput)
            .then(suggestions => {
                setLoading(null);
                setHideInput(suggestions && suggestions.length);
                if(boxInTheMiddle){
                    setBoxInTheMiddle(false);
                }
            })
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
        {loading && (
            <div className='loading message shadow'>
                <LoadingIcon />
                <span>{loading}</span>
            </div>
        )}
    </div>
    )
}
  
  export default FindPlace;