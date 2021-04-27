import { makeAutoObservable } from "mobx";

export default class WidthStore {
    isMobile: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setIsMobile = (isMobile: boolean) => {
        this.isMobile = isMobile;
    }

    handleWindowSizeChange() {
        // console.log(window.innerWidth);
        // const isMobile: boolean = window.innerWidth <= 768;
        // this.setIsMobile(isMobile);
        this.isMobile = window.innerWidth <= 768;
        console.log(this.isMobile);
    }
}