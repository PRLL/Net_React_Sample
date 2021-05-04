import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import useQuery from "../../app/common/util/hooks";

export default function RegisterSuccess() {
    const { t } = useTranslation();

    const email = useQuery().get('email') as string;

    function handleVerificationEmailResend() {
        agent.Account.resendVerificationEmail(email).then(() => {
            toast.success(t('verification_email_resent'));
        }).catch(error => console.log(error));
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header icon color='green'>
                <Icon name='check' />
                { t('successfully_registered') }
            </Header>
            <p>{ t('check_email') }</p>
            {
                email && (
                    <>
                        <p>{ t('click_to_resend') }</p>
                        <Button 
                            primary content={ t('resend_email') } size='huge'
                            onClick={ handleVerificationEmailResend }
                        />
                    </>
                )
            }
        </Segment>
    )
}