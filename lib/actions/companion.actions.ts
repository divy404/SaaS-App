'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import {output, ZodObject, ZodString} from "zod";
import {$strip} from "zod/v4/core";
import {Writeable} from "zod/v3";

export  const  createCompanion = async (formData: output<ZodObject<Writeable<{
    name: ZodString;
    subject: ZodString;
    topic: ZodString;
    voice: ZodString;
    style: ZodString;
    duration: ZodString
}>, $strip>>) => {
    const { userId: author} = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions')
        .insert({...formData, author})
        .select();

    if (error || !data) throw new Error(error ?.message || 'Failed to create companion');
    return data[0];
}

export const getAllCompanions = async ({limit = 10,page = 1, subject, topic} : GetAllCompanions) => {
           const supabase = createSupabaseClient();

           let query = supabase.from('companions').select();

           if(subject && topic) {
               query = query.ilike('subject', `%${subject}%`)
                   .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)

           } else if(subject) {
               query = query.ilike('subject', `%${subject}%`)
           } else if(topic) {
               query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
           }
           query = query.range((page - 1) * limit, page * limit - 1);

           const {data:companions, error} = await query;
           if(error) throw new Error(error.message);
           return companions;
}