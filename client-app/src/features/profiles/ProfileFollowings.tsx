import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Card, Grid, Header, Tab } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import ProfileCard from "./ProfileCard";

export default observer(function ProfileFollowings() {
    const { profileStore } = useStore();
    const { profile } = profileStore;

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
        <Tab.Pane loading={ profileStore.followingsLoading }>
            <Grid>
                <Grid.Column width='16'>
                    <Header
                        floated='left' icon='user'
                        content={ 'People ' + (profileStore.activeTab === 3 ? `following ${profile?.displayName}` : `${profile?.displayName} is following`) }
                    />
                </Grid.Column>
                <Grid.Column width='16'>
                    <Card.Group itemsPerRow={ isMobile ? '2' : '4' }>
                        {
                            profileStore.followings.map(profile => (
                                <ProfileCard key={ profile.username } profile={ profile } />))
                        }
                    </Card.Group>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})