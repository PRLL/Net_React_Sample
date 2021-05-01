import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Divider, Grid, Header, Item, Segment, Statistic } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import FollowButton from "./FollowButton";

interface Props {
    profile: Profile;
}

export default observer(function ProfileHeader({ profile } : Props) {
    const { t } = useTranslation();

    return (
        <Segment>
            <Grid>
                <Grid.Column width='10'>
                    <Item.Group>
                        <Item>
                            <Item.Image avatar size='small' src={ profile?.image || '/assets/user.png' } />
                            <Item.Content verticalAlign='middle'>
                                <Header as='h1' content={ profile?.displayName } />
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Grid.Column>
                <Grid.Column width='1' />
                <Grid.Column width='4'>
                    <Statistic.Group widths='2'>
                        <Statistic
                            label={ profile.followersCount === 1 ? t('follower') : t('followers') } 
                            value={ profile.followersCount }
                        />
                        <Statistic label={ t('following') } value={ profile.followingCount } />
                    </Statistic.Group>
                    <Divider />
                    <FollowButton profile={ profile } />
                </Grid.Column>
            </Grid>
        </Segment>
    )
})