import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function NotFound() {
    const { t } = useTranslation();
  
    return (
        <Segment placeholder>
            <Header icon>
                <Icon name='search' />
                { t('oops_404') }
            </Header>
            <Segment.Inline>
                <Button as={ Link } to='/activities' primary >
                    { t('return_to_activities') }
                </Button>
            </Segment.Inline>
        </Segment>
    )
}