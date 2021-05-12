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

    const { profileStore } = useStore();

    const panes = [
        { menuItem: { content: (isMobile ? '' :  t('about')), icon: 'user' }, render: () => <ProfileAbout /> },
        { menuItem: { content: (isMobile ? '' :  t('photos')), icon: 'photo' }, render: () => <ProfilePhotos profile={ profile } /> },
        { menuItem: { content: (isMobile ? '' :  t('events')), icon: 'calendar alternate outline' }, render: () => <ProfileActivities /> },
        { menuItem: { content: (isMobile ? '' :  t('followers')), icon: 'share square outline' }, render: () => <ProfileFollowings /> },
        { menuItem: { content: (isMobile ? '' :  t('following')), icon: 'sign-in' }, render: () => <ProfileFollowings /> }
    ]

    return (
        <>
            {
                isMobile
                    ? (
                        <Tab
                            panes={ panes }
                            onTabChange={ (mouseEvent, tabProps) => profileStore.setActiveTab(tabProps.activeIndex) }
                        />
                    )
                    : (
                        <Tab
                            menu={ {fluid: true, vertical: true} }
                            menuPosition='right'
                            panes={ panes }
                            onTabChange={ (mouseEvent, tabProps) => profileStore.setActiveTab(tabProps.activeIndex) }
                        />
                    )
            }
        </>
    )
})