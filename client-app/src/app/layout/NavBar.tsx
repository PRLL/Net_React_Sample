import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button, Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { useStore } from '../stores/store';

export default observer(function NavBar() {
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
                    <img src='/assets/logo.png' alt="logo" style={{ marginRight: '10px' }} />
                    { isMobile ? '' : 'HOME' }
                </Menu.Item>
                <Menu.Item name='Activities' as={ NavLink } to='/activities' />
                <Menu.Item>
                    <Button
                        as={ Link } to='/createActivity'
                        positive content={ 'Create' + (isMobile ? '' : ' Event') }
                    />
                </Menu.Item>
                {/* <Menu.Item name='Error Validation Test' as={ NavLink } to='/errors' /> */}
                <Menu.Item position='right'>
                    <Image src={ user?.image || '/assets/user.png' } avatar spaced='right'/>
                    <Dropdown pointing='top right' text={ user?.displayName }>
                        <Dropdown.Menu>
                            <Dropdown.Item as={ Link } to={ `/profiles/${user?.username}` } text='My Profile' icon='user'/>
                            <Dropdown.Item onClick={ logout } text='Logout' icon='power'/>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>
            </Container>
        </Menu>
    )
})