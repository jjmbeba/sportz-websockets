import {type Match, MATCH_STATUS} from '../validation/matches';

export function getMatchStatus(startTime:string, endTime:string, now = new Date()) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match:Match, updateStatus: (nextStatus: typeof MATCH_STATUS) => Promise<void>) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (!nextStatus) {
        return match.status;
    }
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus as unknown as typeof MATCH_STATUS);
        match.status = nextStatus;
    }
    return match.status;
}