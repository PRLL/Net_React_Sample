import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Header, Segment, Button, Icon } from 'semantic-ui-react';
import { useStore } from '../../app/stores/store';
import LoginForm from '../users/LoginForm';
import RegisterForm from '../users/RegisterForm';

export default observer(function HomePage() {
    const { t } = useTranslation();
  
    const { userStore, modalStore } = useStore();

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
        <Segment inverted textAlign='center' vertical className='masthead' styles={ {float: 'center'} }>
            <Container text>
                <Header as='h1' inverted>
                    <Icon name={ isMobile ? 'mobile alternate' : 'desktop' } size='massive' style={ {marginBottom: 12} } />
                </Header>
                {
                    userStore.isLoggedIn
                        ? (
                            <>
                                <Header as='h2' inverted content={ t('welcome') } />
                                <Button as={ Link } to='/activities' size='huge' inverted>
                                    { t('go_to') }
                                </Button>
                            </>)
                        : (
                            <>
                                <Button onClick={ () => modalStore.open(<LoginForm />) } size='huge' inverted>
                                    { t('login') }
                                </Button>
                                <Button onClick={ () => modalStore.open(<RegisterForm />) } size='huge' inverted>
                                    { t('register') }
                                </Button>
                            </>)
                }
            </Container>
        </Segment>
    )
})