import { observer } from 'mobx-react-lite';
import React, { SyntheticEvent, useState } from 'react';
import { Button, Item, Label, Segment } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
// import { Activity } from '../../../models/activity';

// interface Props {
//     activities: Activity[];
//     submitting: boolean;
//     // selectActivity: (id: string) => void;
//     deleteActivity: (id: string) => void;
// }

export default observer(function ActivityList(/*{ activities, submitting, selectActivity, deleteActivity }: Props*/) {
    const { activityStore } = useStore();
    const { activitiesByDate } = activityStore;

    const [target, setTarget] = useState('');

    function handleActivityDelete(event: SyntheticEvent<HTMLButtonElement>, id: string) {
        setTarget(event.currentTarget.name);
        activityStore.delete(id);
    }

    return (
        <Segment>
            <Item.Group divided>
                { activitiesByDate.map(activity => (
                    <Item key={ activity.id }>
                        <Item.Content>
                            <Item.Header as='a'>{ activity.title }</Item.Header>
                            <Item.Meta>{ activity.date }</Item.Meta>
                            <Item.Description>
                                <div>{ activity.description }</div>
                                <div>{ activity.city }, { activity.venue }</div>
                            </Item.Description>
                            <Item.Extra>
                                <Button
                                    name={ activity.id }
                                    loading={ activityStore.loading && target === activity.id }
                                    onClick={ (event) => handleActivityDelete(event, activity.id) }
                                    floated='right' content='Delete' color='red'
                                />
                                <Button
                                    onClick={ () => activityStore.select(activity.id) }
                                    floated='right' content='View' color='blue'
                                />
                                <Label basic content={ activity.category } />
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                )) }
            </Item.Group>
        </Segment>
    )
})