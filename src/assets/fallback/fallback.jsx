import React, { Component } from 'react';

class fallback extends Component {
    render() {
        return (
            <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '80px' }}>Loading.......</h1>
            </div>
        );
    }
}

export default fallback;