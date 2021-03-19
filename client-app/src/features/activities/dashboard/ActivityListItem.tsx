import { SyntheticEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Item, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { Activity } from "../../../app/models/activity";

interface Props {
    activity: Activity
}

export default function ActivityListItem({ activity } : Props) {
    const { activityStore } = useStore();
    const [target, setTarget] = useState('');

    function handleActivityDelete(event: SyntheticEvent<HTMLButtonElement>, id: string) {
        setTarget(event.currentTarget.name);
        activityStore.delete(id);
    }

    return (
        <Segment.Group>
            <Segment>
                <Item.Group>
                    <Item>
                        <Item.Image size='tiny' circular src='/assets/user.png' />
                        <Item.Content>
                            <Item.Header as={ Link } to={ `/activities/${activity.id}` }>{ activity.title }</Item.Header>
                            <Item.Description>Hosted by Bob</Item.Description>
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Segment>
            <Segment>
                <span>
                    <Icon name='clock' />{ activity.date }
                    <Icon name='marker' />{ activity.venue }
                </span>
            </Segment>
            <Segment secondary>
                Attendees...
            </Segment>
            <Segment clearing>
                <span>{ activity.description }</span>
                <Button
                    name={ activity.id }
                    loading={ activityStore.loading && target === activity.id }
                    onClick={ (event) => handleActivityDelete(event, activity.id) }
                    floated='right' content='Delete' color='red'
                 />
                <Button
                    as={ Link } to={ `/activities/${activity.id}` }
                    floated='right' content='View' color='teal'
                />
            </Segment>
        </Segment.Group>

        // <Item key={ activity.id }>
        //     <Item.Content>
        //         <Item.Header as='a'>{ activity.title }</Item.Header>
        //         <Item.Meta>{ activity.date }</Item.Meta>
        //         <Item.Description>
        //             <div>{ activity.description }</div>
        //             <div>{ activity.city }, { activity.venue }</div>
        //         </Item.Description>
        //         <Item.Extra>
        //             <Button
        //                 name={ activity.id }
        //                 loading={ activityStore.loading && target === activity.id }
        //                 onClick={ (event) => handleActivityDelete(event, activity.id) }
        //                 floated='right' content='Delete' color='red'
        //             />
        //             <Button
        //                 as={ Link } to={ `/activities/${activity.id}` }
        //                 floated='right' content='View' color='blue'
        //             />
        //             <Label basic content={ activity.category } />
        //         </Item.Extra>
        //     </Item.Content>
        // </Item>
    )
}