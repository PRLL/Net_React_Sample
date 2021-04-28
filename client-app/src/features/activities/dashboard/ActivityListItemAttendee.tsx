import { observer } from "mobx-react-lite";
import { List, Image, Popup } from "semantic-ui-react";
import { Profile } from "../../../app/models/profile";
import ProfileCard from "../../profiles/ProfileCard";

interface Props {
    attendees: Profile[];
}

export default observer(function ActivityListItemAttendee({ attendees } : Props) {
    const followingStyle = {
        borderColor: 'green',
        borderWidth: 3
    }

    return (
        <List horizontal>
            {
                attendees.map(attendee => (
                    <Popup on='click' key={ attendee.username } trigger={
                        <List.Item key={ attendee.username }>
                            <Image
                                size='mini' circular bordered
                                src={ attendee.image || '/assets/user.png' }
                                style={ attendee.following ? followingStyle : null }
                            />
                        </List.Item> }
                    >
                        <Popup.Content>
                            <ProfileCard profile={ attendee } />
                        </Popup.Content>
                    </Popup>))
            }
        </List>
    )
})