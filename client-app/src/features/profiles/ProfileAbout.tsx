import { useState } from 'react';
import { useStore } from "../../app/stores/store";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import ProfileEditForm from "./ProfileEditForm";
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(function ProfileAbout() {
    const { t } = useTranslation();

    const { profileStore } = useStore();
    const { isProfileFromCurrentUser, profile } = profileStore;
    const [editMode, setEditMode] = useState(false);

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width='16'>
                    <Header floated='left' content={ t('about') + ` ${profile?.displayName}` } />
                    {
                        isProfileFromCurrentUser && (
                            <Button
                                floated='right'
                                basic
                                content={ editMode ? t('cancel') : t('edit_profile') }
                                onClick={ () => setEditMode(!editMode) }
                            />
                        )
                    }
                </Grid.Column>
                <Grid.Column width='16'>
                    {
                        editMode
                            ? <ProfileEditForm setEditMode={ setEditMode } />
                            : <span style={ {whiteSpace: 'pre-wrap'} }>{ profile?.bio }</span>
                    }
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})