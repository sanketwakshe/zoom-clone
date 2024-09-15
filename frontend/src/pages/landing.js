import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate(); // Move useNavigate inside the functional component

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Video Call</h2>
                </div>
                <div className='navList'>
                    <p onClick={() => {
                        navigate("/cflker3"); // Use navigate to programmatically route
                    }}>
                        Join as Guest
                    </p>
                    <p onClick={()=>{
                        window.location.href= '/auth'
                         
                    }}>Register</p>
                    <div role='button'>
                        <p onClick={()=>{
                            window.location.href = "/auth"
                        }}>Login</p>
                    </div>
                </div>
            </nav>
            <div className='landingMainContainer'>
                <div>
                    <h1>
                        <span style={{ color: '#FF9839' }}>Connect</span> With Your Loved One
                    </h1>
                    <p>Cover a distance by video call</p>
                    <div role='button'>
                        <Link to={'/auth'}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='/mobile.png' alt='mobile image' /> {/* Corrected the 'alt' attribute */}
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
