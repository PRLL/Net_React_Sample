
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Grid } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import ActivityList from './ActivityList';
import ActivityFilters from './ActivityFilters';

export default observer(function ActivityDashboard() {
    const { activityStore } = useStore();
  
    useEffect(() => {
      activityStore.list();
    }, [activityStore])
  
    if (activityStore.loadingInitial) return <LoadingComponent content='Fetching Activities...' />

    return (
        <Grid>
            <Grid.Column width='10'>
                <ActivityList />
            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilters />
            </Grid.Column>
        </Grid>
    )
})