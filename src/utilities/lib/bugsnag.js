// This file instantiates one Bugsnag client for the entire application

// Components and modules that want to send handled errors can import the
// exported client to send handled errors

// Components can get access to the React <ErrorBoundary/> by calling
//
//    const ErrorBoundary = bugsnagClient.getPlugin('react')
//

import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'
import React from 'react'
let toggleVar = false;
process.env.REACT_APP_BUGSNAG === 'true' ? toggleVar = true : toggleVar = false;

const bugsnagClient = bugsnag({ apiKey: '8757053370e5b3125c025b881c284495', autoNotify: toggleVar,autoCaptureSessions: toggleVar })
  .use(bugsnagReact, React)

export default bugsnagClient

