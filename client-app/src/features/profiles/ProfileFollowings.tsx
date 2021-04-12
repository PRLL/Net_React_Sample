import { observer } from "mobx-react-lite";
import { Card, Grid, Header, Tab } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import ProfileCard from "./ProfileCard";

export default observer(function ProfileFollowings() {
    const { profileStore } = useStore();
    const { profile } = profileStore;

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
                    <Card.Group itemsPerRow='4'>
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