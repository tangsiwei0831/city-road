import '../styles/findplace.css'

function FindPlace() {
    return (
    <div className='find-place'>
        <div>
            <h3 className='site-header'>city roads</h3>
            <p className='description'>This website renders every single road within a city</p>
        </div>
        <form className='search-box'>
            <input type='text' placeholder='Ener a city name to start'></input>
            <a className='search-submit' type='submit'>Find City Bounds</a>
        </form>
    </div>
    )
  }
  
  export default FindPlace