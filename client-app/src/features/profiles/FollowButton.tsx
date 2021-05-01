import { observer } from "mobx-react-lite";
import { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, Reveal } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import { useStore } from "../../app/stores/store";

interface Props {
    profile: Profile;
}

export default observer(function FollowButton({ profile }: Props) {
    const { t } = useTranslation();

    const { profileStore, userStore } = useStore();

    if (userStore.user?.username === profile.username) return null;

    function handleFollow(syntheticEvent: SyntheticEvent, username: string) {
        syntheticEvent.preventDefault();
        profile.following
            ? profileStore.updateFollowing(username, false)
            : profileStore.updateFollowing(username, true);
    }

    return (
        <Reveal animated='move'>
            <Reveal.Content visible style={ {width: '100%'} }>
                <Button
                    fluid color='teal'
                    content={ (profile.following ? '' : t('not')) + ' ' + t('following') }
                />
            </Reveal.Content>
            <Reveal.Content hidden style={ {width: '100%'} }>
                <Button
                    fluid
                    color={ profile.following ? 'red' : 'green' }
                    content={ profile.following ? t('unfollow') : t('follow') }
                    loading={ profileStore.mainLoading }
                    onClick={ (mouseEvent) => handleFollow(mouseEvent, profile.username) }
                />
            </Reveal.Content>
        </Reveal>
    )

})