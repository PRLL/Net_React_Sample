import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { Button, Container, Dropdown, Icon, Image, Menu } from 'semantic-ui-react';
import { useStore } from '../stores/store';

export default observer(function NavBar() {
    const { t, i18n } = useTranslation();

    const changeLanguage = () => {
        if (i18n.language === 'en') {
            i18n.changeLanguage('es');
        } else {
            i18n.changeLanguage('en');
        }
    }

    const { userStore: { user, logout } } = useStore();

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
        <Menu inverted fixed='top'>
            <Container>
                <Menu.Item as={ NavLink } to='/' exact header>
                    <Icon name='home' size='big' />
                    { isMobile ? '' : t('home') }
                </Menu.Item>
                <Menu.Item name={ t('events') } as={ NavLink } to='/activities' />
                <Menu.Item>
                    <Button
                        as={ Link } to='/createActivity'
                        positive content={ t('create') + (isMobile ? '' : ' ' + t('event')) }
                    />
                </Menu.Item>
                <Menu.Item onClick={ changeLanguage }>
                    { isMobile ? '' : t('change_language') }
                    <img src={ '/assets/' + (i18n.language === 'en' ? 'spain_flag.png' : 'usa_flag.png') } alt='locale' style={ {marginLeft: (isMobile ? '0px' : '10px')} } />
                </Menu.Item>
                {/* <Menu.Item name='Error Validation Test' as={ NavLink } to='/errors' /> */}
                <Menu.Item position='right'>
                    <Image src={ user?.image || '/assets/user.png' } avatar spaced='right'/>
                    <Dropdown pointing='top right' text={ user?.displayName }>
                        <Dropdown.Menu>
                            <Dropdown.Item as={ Link } to={ `/profiles/${user?.username}` } text={ t('my_profile') } icon='user' />
                            <Dropdown.Item onClick={ logout } text={ t('logout') } icon='power' />
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>
            </Container>
        </Menu>
    )
})