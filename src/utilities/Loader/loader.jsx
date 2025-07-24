import React from 'react';
import BounceLoader from "react-spinners/BounceLoader";

const siteloader = {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    backgroundClip: 'padding-box',
    zIndex: 99999,
    outline: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
}

const loader = () => (
    <div style={siteloader}>
        <BounceLoader
            size={100}
            color="var(--theme-color)"
            loading={true}
        />
    </div>
);

export default loader;