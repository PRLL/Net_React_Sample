import { SyntheticEvent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tab, Grid, Header, Card, Image, TabProps } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ProfileActivity } from '../../app/models/profile';
import { useStore } from "../../app/stores/store";
import { useTranslation } from 'react-i18next';

export default observer(function ProfileActivities() {
    const { t } = useTranslation();

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

    const panes = [
        { menuItem: t('future_events'), pane: { key: 'future' } },
        { menuItem: t('hosting'), pane: { key: 'hosting' } },
        { menuItem: t('past_events'), pane: { key: 'past' } }
    ];

    return (
        <Tab.Pane loading={ loadingActivities }>
            <Grid>
                <Grid.Column width='16'>
                    <Header floated='left' icon='calendar' content={ t('events') } />
                </Grid.Column>
                <Grid.Column width='16'>
                    <Tab
                        panes={ panes }
                        menu={ {secondary: true, pointing: true} }
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
                                        <div>{ t("date_daymonth", { date: new Date(activity.date) }) }</div>
                                        <div>{ t("date_hour", { date: new Date(activity.date) }) }</div>
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