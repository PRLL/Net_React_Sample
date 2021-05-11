import { useEffect, useState } from "react";
import { Button, Grid, Header } from "semantic-ui-react";
import PhotoWidgetDropzone from "./PhotoWidgetDropzone";
import PhotoWidgetCropper from "./PhotoWidgetCropper";
import { useTranslation } from "react-i18next";

interface Props {
    uploadPhoto: (file: Blob) => void;
    loading: boolean;
}

export default function PhotoUploadWidget({ uploadPhoto, loading } : Props) {
    const { t } = useTranslation();

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

    const [files, setFiles] = useState<any>([]);
    const [cropper, setCropper] = useState<Cropper>();
    // const [upload, setUpload] = useState<boolean>(false);
    // const [croppedImage, setCroppedImage] = useState<File>();

    // function onCrop() {
    //     if (cropper) {
    //         cropper.getCroppedCanvas().toBlob(blob => setCroppedImage(new File([blob!], 'cropped_image.png', { type:"image/png", lastModified:new Date().getTime() })));
    //     }

    //     setUpload(true);
    // }

    function onUpload() {
        if (cropper) {
            cropper.getCroppedCanvas().toBlob(blob => uploadPhoto(blob!));
        }
    }
    
    function close() {
        setFiles([]);
    }

    // function backToCrop() {
    //     setUpload(false);
    // }

    useEffect(() => {
        return () => {
            files.forEach((file: any) => {
                URL.revokeObjectURL(file.preview);
            });
        }
    }, [files])

    return (
        isMobile
            ? (
                <>
                {
                    files && files.length > 0
                        ? (
                            // upload
                                // ? (
                                //     <>
                                //         {
                                //             croppedImage !== undefined && (
                                //                 <>
                                //                     <Header sub color='teal' content={ t('step_3') } />
                                //                     { console.log("croppedImage") }
                                //                     { console.log(croppedImage) }
                                //                     <Image src={ croppedImage } alt='' />
                                //                     <Button.Group widths={ 2 }>
                                //                         <Button loading={ loading } onClick={ onUpload } positive icon='check' />
                                //                         <Button disabled={ loading } onClick={ backToCrop } icon='arrow left' />
                                //                     </Button.Group>
                                //                 </>
                                //             )
                                //         }
                                //     </>

                                // )
                                // : (
                                    <>
                                        <Header color='teal' content={ t('step_2') } />
                                        <PhotoWidgetCropper setCropper={ setCropper } imagePreview={ files[0].preview } />
                                        <Button.Group widths={ 2 }>
                                            <Button loading={ loading } onClick={ onUpload } positive icon='check' />
                                            <Button disabled={ loading } onClick={ close } icon='arrow left' />
                                        </Button.Group>
                                    </>
                                // )
                        )
                        : (
                            <>
                                <Header color='teal' content={ t('step_1') } />
                                <PhotoWidgetDropzone setFiles={ setFiles }/>
                            </>
                        )
                }
                </>
            )
            : (
                <Grid>
                    <Grid.Column width='4'>
                        <Header color='teal' content={ t('step_1') } />
                        <PhotoWidgetDropzone setFiles={ setFiles }/>
                    </Grid.Column>
                    <Grid.Column width='1' />
                    <Grid.Column width='4'>
                        <Header color='teal' content={ t('step_2') } />
                        {
                            files && files.length > 0 && (
                                <PhotoWidgetCropper setCropper={ setCropper } imagePreview={ files[0].preview } />
                            )
                        }
                    </Grid.Column>
                    <Grid.Column width='1' />
                    <Grid.Column width='4'>
                        <Header sub color='teal' content={ t('step_3') } />
                        {
                            files && files.length > 0 && (
                                <>
                                    <div className='img-preview' style={ {minHeight: 200, overflow: 'hidden'} } />
                                    <Button.Group widths={ 2 }>
                                        <Button loading={ loading } onClick={ onUpload } positive icon='check' />
                                        <Button disabled={ loading } onClick={ close } icon='close' />
                                    </Button.Group>
                                </>
                            )
                        }
                    </Grid.Column>
                </Grid>
            )
        
    )
}