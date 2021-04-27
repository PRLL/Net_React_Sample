import { SyntheticEvent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tab, Grid, Header, Card, Image, TabProps } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ProfileActivity } from '../../app/models/profile';
import { format } from 'date-fns';
import { useStore } from "../../app/stores/store";

const panes = [
    { menuItem: 'Future Events', pane: { key: 'future' } },
    { menuItem: 'Hosting', pane: { key: 'hosting' } },
    { menuItem: 'Past Events', pane: { key: 'past' } }
];

export default observer(function ProfileActivities() {
    const { profileStore } = useStore();
    const {
        loadProfileActivities,
        profile,
        loadingActivities,
        profileActivities
    } = profileStore;

    useEffect(() => {
        loadProfileActivities(profile!.username);
    }, [loadProfileActivities, profile]);

    const handleTabChange = (syntheticEvent: SyntheticEvent, tabProps: TabProps) => {
        loadProfileActivities(profile!.username, panes[tabProps.activeIndex as number].pane.key);
    };

    const [width, setWidth] = useState<number>(window.innerWidth);
    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);
    
    let isMobile: boolean = (width <= 768);

    return (
        <Tab.Pane loading={ loadingActivities }>
            <Grid>
                <Grid.Column width='16'>
                    <Header floated='left' icon='calendar' content={ 'Events' } />
                </Grid.Column>
                <Grid.Column width='16'>
                    <Tab
                        panes={ panes }
                        menu={{ secondary: true, pointing: true }}
                        onTabChange={(e, data) => handleTabChange(e, data)}
                    />
                    <br />
                    <Card.Group itemsPerRow={ isMobile ? '2' : '4' }>
                    {
                        profileActivities.map((activity: ProfileActivity) => (
                            <Card
                                as={ Link }
                                to={ `/activities/${activity.id}` }
                                key={ activity.id }
                            >
                                <Image
                                    src={ `/assets/categoryImages/${activity.category}.jpg` }
                                    style={ {minHeight: 100, objectFit: 'cover'} }
                                />
                                <Card.Content>
                                    <Card.Header textAlign='center'>{ activity.title }</Card.Header>
                                    <Card.Meta textAlign='center'>
                                        <div>{ format(new Date(activity.date), 'do LLL') }</div>
                                        <div>{ format(new Date(activity.date), 'h:mm a') }</div>
                                    </Card.Meta>
                                </Card.Content>
                            </Card>
                        ))
                    }
                    </Card.Group>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    );
});