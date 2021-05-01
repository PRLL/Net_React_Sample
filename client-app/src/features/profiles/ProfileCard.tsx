import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Icon, Image } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import FollowButton from "./FollowButton";

interface Props {
    profile: Profile;
}

export default observer(function ProfileCard({ profile } : Props) {
    const { t } = useTranslation();

    function truncateBio(bio: string | undefined) {
        if (bio) {
            return bio.length > 40
                ? bio.substring(0, 37) + '...'
                : bio;
        }
    }

    return (
        <Card>
            <Image src={ profile.image || '/assets/user.png'} as={ Link } to={ `/profiles/${profile.username}` } />
            <Card.Content>
                <Card.Header as={ Link } to={ `/profiles/${profile.username}` }>{ profile.displayName }</Card.Header>
                <Card.Description>{ truncateBio(profile.bio) }</Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Icon name='user' />
                { profile.followersCount + ' ' + t('follower') + (profile.followersCount === 1 ? '' : t('(s)')) }
            </Card.Content>
            <FollowButton profile={ profile } />
        </Card>
    )
})