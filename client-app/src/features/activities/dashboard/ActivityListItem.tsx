import { Link } from "react-router-dom";
import { Button, Icon, Item, Label, Segment } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import ActivityListItemAttendee from "./ActivityListItemAttendee";
import { useTranslation } from "react-i18next";

interface Props {
    activity: Activity
}

export default function ActivityListItem({ activity } : Props) {
    const { t } = useTranslation();

    return (
        <Segment.Group>
            <Segment>
                {
                    activity.isCancelled && (
                        <Label attached='top' color='red' content={ t('cancelled') } style={ {textAlign: 'center'} } />
                    ) 
                }
                <Item.Group>
                    <Item>
                        <Item.Image style={ {marginBottom: 3} }size='tiny' circular src={ activity.host?.image || '/assets/user.png' } />
                        <Item.Content>
                            <Item.Header as={ Link } to={ `/activities/${activity.id}` }>{ activity.title }</Item.Header>
                            <Item.Description>
                                { t('hosted_by') } <Link to={ `profiles/${activity.hostUsername}` }>{ activity.host?.displayName }</Link>
                            </Item.Description>
                            {
                                activity.isHost
                                    ? (
                                        <Item.Description>
                                            <Label basic color='orange'>
                                                { t('you_are_host') }
                                            </Label>
                                        </Item.Description>)
                                    : activity.isGoing && (
                                        <Item.Description>
                                            <Label basic color='green'>
                                                { t('you_are_going') }
                                            </Label>
                                        </Item.Description>)
                            }
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Segment>
            <Segment>
                <span>
                    <Icon name='clock' />{ t("date_detail", { date: activity.date! }) }
                    <Icon name='marker' />{ activity.venue }
                </span>
            </Segment>
            <Segment secondary>
                <ActivityListItemAttendee attendees={ activity.attendees! } />
            </Segment>
            <Segment clearing>
                <span>{ activity.description }</span>
                <Button
                    as={ Link } to={ `/activities/${activity.id}` }
                    floated='right' content={ t('view') } color='teal'
                />
            </Segment>
        </Segment.Group>
    )
}