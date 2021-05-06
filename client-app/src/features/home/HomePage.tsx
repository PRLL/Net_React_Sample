import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Header, Segment, Button, Icon, Divider, Grid } from 'semantic-ui-react';
import { useStore } from '../../app/stores/store';
import i18n from '../../i18n';
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

    function handleGithubRedirect() {
        window.open('https://github.com/PRLL/Net_React_Sample', '_blank');
    }

    function handleDocumentationRedirect() {
        if (i18n.language === 'en') {
            window.open('https://github.com/PRLL/Net_React_Sample', '_blank');
            // window.open('https://drive.google.com/file/d/1h0w8lhFLoGINizT_aFg1W5BFGrH-Xr3x/view?usp=sharing', '_blank');
        } else {
            window.open('https://drive.google.com/file/d/1h0w8lhFLoGINizT_aFg1W5BFGrH-Xr3x/view?usp=sharing', '_blank');
        }
    }

    const handleChangeLanguage = () => {
        if (i18n.language === 'en') {
            i18n.changeLanguage('es');
        } else {
            i18n.changeLanguage('en');
        }
    }

    return (
        <>
            <Segment inverted textAlign='center' vertical className='masthead' styles={ {float: 'center'} }>
                <Grid>
                    <Grid.Row verticalAlign='middle'>
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
                                            <Divider horizontal inverted>{ t('or') }</Divider>
                                            <Button
                                                size='huge' inverted color='facebook' content={ t('facebook_login') }
                                                loading={ userStore.facebookLoading }
                                                onClick={ userStore.facebookLogin }
                                            />
                                        </>)
                            }
                            <Divider horizontal inverted />
                            <Icon onClick={ handleGithubRedirect } link name='github' size='huge' style={ {marginBottom: '60px'} } />
                            <img onClick={ handleChangeLanguage } width='62' height='66' src={ '/assets/' + (i18n.language === 'en' ? 'spain_flag.png' : 'usa_flag.png') } alt='locale' />
                            <Icon onClick={ handleDocumentationRedirect } link name='file pdf' size='huge' style={ {marginBottom: '60px'} } />
                        </Container>
                    </Grid.Row>
                </Grid>
            </Segment>
        </>
    )
})