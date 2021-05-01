import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Tab } from "semantic-ui-react"
import { Profile } from "../../app/models/profile"
import { useStore } from "../../app/stores/store"
import ProfileAbout from "./ProfileAbout"
import ProfileActivities from "./ProfileActivities"
import ProfileFollowings from "./ProfileFollowings"
import ProfilePhotos from "./ProfilePhotos"

interface Props {
    profile: Profile;
}

export default observer(function ProfileBody({profile} : Props) {
    const { t } = useTranslation();

    const { profileStore } = useStore();

    const panes = [
        { menuItem: t('about'), render: () => <ProfileAbout /> },
        { menuItem: t('photos'), render: () => <ProfilePhotos profile={ profile } /> },
        { menuItem: t('events'), render: () => <ProfileActivities /> },
        { menuItem: t('followers'), render: () => <ProfileFollowings /> },
        { menuItem: t('following'), render: () => <ProfileFollowings /> }
    ]

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
        <>
            {
                isMobile
                    ? (
                        <Tab
                            menu={ {fluid: true } }
                            panes={ panes }
                            onTabChange={ (mouseEvent, tabProps) => profileStore.setActiveTab(tabProps.activeIndex) }
                        />)
                    : (
                        <Tab
                        menu={ {fluid: true, vertical: true} }
                        menuPosition='right'
                        panes={ panes }
                        onTabChange={ (mouseEvent, tabProps) => profileStore.setActiveTab(tabProps.activeIndex) }
                    />)
            }
        </>
    )
})