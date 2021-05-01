import Calendar from "react-calendar";
import { useTranslation } from "react-i18next";
import { Header, Menu } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default function ActivityFilters() {
    const { t } = useTranslation();

    const { activityStore: { predicate, setPredicate } } = useStore();

    return (
        <>
            <Menu vertical size='large' style={{ width: '100%', marginTop: 25 }}>
                <Header icon='filter' attached color='teal' content='Filters' />
                <Menu.Item 
                    content={ t('all_events') }
                    active={ predicate.has('all') }
                    onClick={ () => setPredicate('all', 'true') }
                />
                <Menu.Item
                    content={ t("you_going") }
                    active={ predicate.has('isGoing') }
                    onClick={ () => setPredicate('isGoing', 'true') }
                />
                <Menu.Item
                    content={ t("you_hosting") }
                    active={ predicate.has('isHost') }
                    onClick={ () => setPredicate('isHost', 'true') }
                />
            </Menu>
            <Header />
            <Calendar
                onChange={ (date) => setPredicate('startDate', date as Date) }
                value={ predicate.get('startDate') || new Date() }
            />
        </>
    )
}