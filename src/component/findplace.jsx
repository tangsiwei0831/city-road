/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import '../styles/findplace.css'

function FindPlace() {
    const [enteredInput, setEnteredInput] = useState('');
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        setEnteredInput(e.target.value);
      };

    return (
    <div className='find-place'>
        <div>
            <h3 className='site-header'>city roads</h3>
            <p className='description'>This website renders every single road within a city</p>
        </div>
        <form className='search-box'>
            <input 
                type='text' 
                placeholder='Ener a city name to start' 
                value={enteredInput}
                onChange={handleInputChange}
                ref={inputRef}>
            </input>
            {enteredInput && (
            <a
                type='submit'
                className='search-submit'
                href='#'>
                Find City Bounds
            </a>)}
        </form>
    </div>
    )
  }
  
  export default FindPlace