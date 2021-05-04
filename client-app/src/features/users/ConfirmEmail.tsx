import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import useQuery from "../../app/common/util/hooks";
import { useStore } from "../../app/stores/store";
import LoginForm from "./LoginForm";

export default function ConfirmEmail() {
    const { t } = useTranslation();

    const { modalStore } = useStore();
    const email = useQuery().get('email') as string;
    const emailVerificationToken = useQuery().get('emailVerificationToken') as string;

    const Status = {
        Verifying: t('verifying'),
        Failed: t('failed'),
        Success: t('success')
    }

    const [status, setStatus] = useState(Status.Verifying);

    function handleVerificationEmailResend() {
        agent.Account.resendVerificationEmail(email).then(() => {
            toast.success(t('verification_email_resent'));
        }).catch(error => console.log(error));
    }

    useEffect(() => {
        agent.Account.verifyEmail(emailVerificationToken, email).then(() => {
            setStatus(Status.Success);
        }).catch(() => {
            setStatus(Status.Failed);
        })
    }, [Status.Failed, Status.Success, emailVerificationToken, email])

    function getBody() {
        switch (status) {
            case Status.Verifying:
                return (
                    <p>{ t('verifying') + '...' }</p>
                )
            case Status.Failed:
                return (
                    <div>
                        <p>{ t('verification_failed') }</p>
                        <Button
                            primary size='huge' content={ t('resend_email') }
                            onClick={ handleVerificationEmailResend }
                        />
                    </div>
                )
            case Status.Success:
                return (
                    <div>
                        <p>{ t('email_verified') }</p>
                        <Button
                            primary size='huge' content={ t('login') }
                            onClick={ () => modalStore.open(<LoginForm />) }
                        />
                    </div>
                )
        }
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header icon>
                <Icon name='envelope' />
                { t('email_verification') }
            </Header>
            <Segment.Inline>
                { getBody() }
            </Segment.Inline>
        </Segment>
    )
}