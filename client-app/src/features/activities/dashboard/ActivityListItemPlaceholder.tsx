import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Segment, Button, Placeholder } from 'semantic-ui-react';

export default function ActivityListItemPlaceholder() {
    const { t } = useTranslation();

    return (
        <Fragment>
            <Placeholder fluid style={ {marginTop: 25} }>
                <Segment.Group>
                    <Segment style={ {minHeight: 110} }>
                        <Placeholder>
                            <Placeholder.Header image>
                                <Placeholder.Line />
                                <Placeholder.Line />
                            </Placeholder.Header>
                            <Placeholder.Paragraph>
                                <Placeholder.Line />
                            </Placeholder.Paragraph>
                        </Placeholder>
                    </Segment>
                    <Segment>
                        <Placeholder>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder>
                    </Segment>
                    <Segment secondary style={ {minHeight: 70} } />
                    <Segment clearing>
                        <Button disabled color='blue' floated='right' content={ t('view') } />
                    </Segment>
                </Segment.Group>
            </Placeholder>
        </Fragment>
    );
};