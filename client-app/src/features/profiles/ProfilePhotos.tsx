import { observer } from "mobx-react-lite";
import { SyntheticEvent, useEffect, useState } from "react";
import { Button, Card, Grid, Header, Image, Tab } from "semantic-ui-react";
import PhotoUploadWidget from "../../app/common/image_upload/PhotoUploadWidget";
import { Photo, Profile } from "../../app/models/profile";
import { useStore } from "../../app/stores/store";

interface Props {
    profile: Profile;
}

export default observer(function ProfilePhotos({profile} : Props) {
    const { profileStore } = useStore();
    const [target, setTarget] = useState('');
    const [addPhotoMode, setAddPhotoMode] = useState(false);

    function handlePhotoUpload(file: Blob) {
        profileStore.uploadPhoto(file).then(() => setAddPhotoMode(false));
    }

    function handleSetMainPhoto(photo: Photo, syntheticEvent: SyntheticEvent<HTMLButtonElement>) {
        setTarget(syntheticEvent.currentTarget.name);
        profileStore.setMainPhoto(photo);
    }

    function handleDeletePhoto(photo: Photo, syntheticEvent: SyntheticEvent<HTMLButtonElement>) {
        setTarget(syntheticEvent.currentTarget.name);
        profileStore.deletePhoto(photo);
    }

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
        <Tab.Pane>
            <Grid>
                <Grid.Column width='16'>
                    <Header floated='left' icon='image' content='Photos' />
                    {
                        profileStore.isProfileFromCurrentUser && (
                            <Button
                                floated='right' basic
                                content={ addPhotoMode ? 'Cancel' : 'Add Photo' }
                                onClick={ () => setAddPhotoMode(!addPhotoMode) }
                            />)
                    }
                </Grid.Column>
                <Grid.Column width='16'>
                    { addPhotoMode ? (
                        <PhotoUploadWidget uploadPhoto={ handlePhotoUpload } loading={ profileStore.uploading }/>
                    ) : (
                        <Card.Group itemsPerRow={ isMobile ? '2' : '5' }>
                            { profile.photos?.map(photo => (
                                <Card key={ photo.id }>
                                    <Image src={ photo.url } />
                                    {
                                        !photo.isMain && profileStore.isProfileFromCurrentUser && (
                                            <Button.Group fluid widths={ 2 }>
                                                <Button
                                                    basic
                                                    color='green'
                                                    content='Main'
                                                    name={ 'setMainPhotoButton' + photo.id }
                                                    disabled={ photo.isMain }
                                                    loading={ target === 'setMainPhotoButton' + photo.id && profileStore.mainLoading }
                                                    onClick={ mouseEvent => handleSetMainPhoto(photo, mouseEvent) }
                                                />
                                                <Button
                                                    basic
                                                    color='red'
                                                    icon='trash'
                                                    name={ 'deletePhotoButton' + photo.id }
                                                    disabled={ photo.isMain }
                                                    loading={ target === 'deletePhotoButton' + photo.id && profileStore.mainLoading }
                                                    onClick={ mouseEvent => handleDeletePhoto(photo, mouseEvent) }
                                                />
                                            </Button.Group>
                                        )
                                    }
                                </Card>
                            )) }
                        </Card.Group>
                    )}
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})