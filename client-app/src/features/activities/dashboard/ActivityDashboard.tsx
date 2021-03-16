import { observer } from 'mobx-react-lite';
import React from 'react';
import { Grid } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
// import { Activity } from '../../../models/activity';
import ActivityDetails from '../details/ActivityDetails';
import ActivityForm from '../form/ActivityForm';
import ActivityList from './ActivityList';

// interface Props {
//     activities: Activity[];
//     submitting: boolean;
    // selectedActivity: Activity | undefined;
    // selectActivity: (id: string) => void;
    // cancelSelectActivity: () => void;
    // editMode: boolean;
    // openForm: (id: string) => void;
    // closeForm: () => void;
    // createOrEdit: (activity: Activity) => void;
//     deleteActivity: (id: string) => void;
// }

export default observer(function ActivityDashboard(/*{ activities, submitting,
    selectActivity, selectedActivity, cancelSelectActivity,
    editMode, openForm, closeForm, createOrEdit,
    deleteActivity }: Props*/) {

    const { activityStore } = useStore();
    const { selectedActivity, editMode } = activityStore;

    return (
        <Grid>
            <Grid.Column width='10'>
                <ActivityList 
                    // activities={ activities }
                    // selectActivity={ selectActivity }
                    // deleteActivity={ deleteActivity }
                    // submitting={ submitting }
                />
            </Grid.Column>
            <Grid.Column width='6'>
                { selectedActivity && !editMode &&
                <ActivityDetails
                    // activity={ selectedActivity }
                    // cancelSelectActivity={ cancelSelectActivity }
                    // openForm={ openForm }
                /> }
                { editMode &&
                <ActivityForm
                    // closeForm={ closeForm }
                    // activity={ selectedActivity }
                    // createOrEdit={ createOrEdit }
                    // submitting={ submitting }
                /> }
            </Grid.Column>
        </Grid>
    )
})