import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Label } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity';
import { useStore } from '../../../app/stores/store';
import { useTranslation } from 'react-i18next';

const activityImageStyle = {
    filter: 'brightness(30%)'
};

const activityImageTextStyle = {
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    width: '100%',
    height: 'auto',
    color: 'white'
};

interface Props {
    activity: Activity
}

export default observer (function ActivityDetailedHeader({activity}: Props) {
    const { t } = useTranslation();

    const { activityStore } = useStore();

    return (
        <Segment.Group>
            <Segment basic attached='top' style={ {padding: '0'} }>
                <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={ activityImageStyle }/>
                {
                    activity.isCancelled && (
                        <Label style={ {position: 'absolute', zIndex: 1000, left: -14, top: 20} } ribbon color='red' content={ t('cancelled') } />
                    )
                }
                <Segment style={ activityImageTextStyle } basic>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                                <Header
                                    size='huge'
                                    content={ activity.title }
                                    style={{ color: 'white' }}
                                />
                                { activity.date && (
                                    <p>{ t("date_store", { date: activity.date! }) }</p>)
                                }
                                <p>
                                    { t('hosted_by') } <strong><Link to={ `/profiles/${activity.host?.username}` }>{ activity.host?.displayName }</Link></strong>
                                </p>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
                { activity.isHost ? (
                    <>
                        <Button
                            onClick={ activityStore.cancel }
                            loading={ activityStore.loading }
                            color={ activity.isCancelled ? 'green' : 'red' }
                            floated='right' content={ activity.isCancelled ? t('reactivate_activity') : t('cancel_event') }
                        />
                        <Button
                            disabled={ activity.isCancelled } 
                            as={ Link } to={ `/edit/${activity.id}` }
                            color='orange' floated='right'
                        >
                            { t('manage_event') }
                        </Button>
                    </>
                ) : activity.isGoing
                    ? (
                        <Button loading={ activityStore.loading } onClick={ activityStore.attend }>{ t('cancel_attendance') }</Button>
                    ) : (
                        <Button disabled={ activity.isCancelled } loading={ activityStore.loading } onClick={ activityStore.attend } color='teal'>{ t('join_activity') }</Button>
                    ) }
            </Segment>
        </Segment.Group>
    )
})