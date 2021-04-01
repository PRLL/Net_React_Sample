import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ProfileBody from "./ProfileBody";
import ProfileHeader from "./ProfileHeader";

export default observer(function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { profileStore } = useStore();
    const { profile } = profileStore;

    useEffect(() => {
        profileStore.load(username);
    }, [profileStore, username])

    if (profileStore.loading) return <LoadingComponent content='Loading Profile...' />

    return (
        <Grid>
            <Grid.Column width='16'>
                { profile && (
                    <>
                        <ProfileHeader profile={ profile } />
                        <ProfileBody profile={ profile } />
                    </>
                )}
            </Grid.Column>
        </Grid>
    )
})