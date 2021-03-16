import React, { Fragment, useEffect, useState } from 'react';
// import logo from './logo.svg';
// import { ducks } from '../../test-typescript_stuff';
// import DuckItem from '../../test-DuckItem';
// import axios from 'axios';
import { /*Header, List*/ Container } from 'semantic-ui-react';
import { Activity } from '../../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // axios.get<Activity[]>('http://localhost:5000/api/activities').then(response => {
    //   // console.log(response);
    //   setActivities(response.data);
    // })
    agent.Activities.list().then(data => {
      setActivities(data);
      setLoading(false);
    })
  }, [])

  function handleSelectActivity(id: String) {
    setSelectedActivity(activities.find(activity => activity.id === id));
  }

  function handleCanceSelectActivity() {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id? : string) {
    id ? handleSelectActivity(id) : handleCanceSelectActivity();
    setEditMode(true);
  }

  function handleFormClose() {
    setEditMode(false);
  }

  function handleCreateOrEditActivity(activity: Activity) {
    // activity.id
    //   ? setActivities([...activities.filter(filteredActivity => filteredActivity.id !== activity.id), activity])
    //   : setActivities([...activities, {...activity, id: uuid()}]);

    setSubmitting(true);
    if (activity.id) {
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(filteredActivity => filteredActivity.id !== activity.id), activity])
        setEditMode(false);
        setSelectedActivity(activity);
        setSubmitting(false);
      })
    }
    else {
      activity.id = uuid();
      agent.Activities.create(activity).then(() => {
        setActivities([...activities, activity]);
        setEditMode(false);
        setSelectedActivity(activity);
        setSubmitting(false);
      })
    }
  }

  function handleDeleteActivity(id: string) {
    setSubmitting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(activity => activity.id !== id)]);
      setSubmitting(false);
    })
  }

  if (loading) return <LoadingComponent content='Loading App...' />

  return (
    <Fragment> {/* can just set it to <> for shorthand */}
      <NavBar openForm={ handleFormOpen }/>
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard 
          activities={ activities }
          selectedActivity={ selectedActivity }
          selectActivity={ handleSelectActivity }
          cancelSelectActivity={ handleCanceSelectActivity }
          editMode={ editMode }
          openForm={ handleFormOpen }
          closeForm={ handleFormClose }
          createOrEdit={ handleCreateOrEditActivity }
          deleteActivity={ handleDeleteActivity }
          submitting={ submitting }
        />
      </Container>
      
      {/* <Header as='h2' icon='users' content='Reactivities' /> */}
      {/* <header className="App-header">

        <img src={logo} className="App-logo" alt="logo" />

        {ducks.map(duck => (<DuckItem duck={duck} key={duck.name}/>))}

        <p style={{color: 'red'}}>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </Fragment>
  );
}

export default App;