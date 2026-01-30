import { Router } from 'express';
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.ts";
import {db} from "../db";
import {matches} from "../db/schema.ts";
import {getMatchStatus} from "../utils/match-status.ts";
import {desc} from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
     const parsed = listMatchesQuerySchema.safeParse(req.query);

     if (!parsed.success) {
         return res.status(400).json({
             error: "Invalid Query",
             details: JSON.stringify(parsed.error),
         });
     }

     const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
     
     try {
         const data = await db
             .select()
             .from(matches)
             .orderBy(desc(matches.createdAt))
             .limit(limit);

         return res.status(200).json({
             data
         });
         
     } catch (err) {
         res.status(500).json({
             error: "Failed to list matches",
             details: JSON.stringify(err),
         })
     }
});

matchRouter.post('/', async (req, res) => {
   const parsed = createMatchSchema.safeParse(req.body);

   if(!parsed.success) {
       return res.status(400).json({
          error: 'Invalid payload',
           details: JSON.stringify(parsed.error),
       });
   }

   try {
       const [event] = await db.insert(matches).values({
          ...parsed.data,
          startTime: new Date(parsed.data.startTime),
           endTime: new Date(parsed.data.endTime),
           homeScore: parsed.data.homeScore ?? 0,
           awayScore: parsed.data.awayScore ?? 0,
           status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
       }).returning();

       res.status(201).json({
           data:event
       });

   } catch (err) {
       res.status(500).json({
           error: 'Failed to create match',
           details: JSON.stringify(err),
       });
   }
});