import { supabase } from '../lib/supabase';
import { Job, JobFormData, JobStatus } from '../types/job';

export const createJob = async (jobData: JobFormData): Promise<{ data: Job | null; error: Error | null }> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(userError?.message || 'User not authenticated');
    }

    // Get client name
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', jobData.client_id)
      .single();

    if (clientError) throw clientError;

    // Get racquet name
    const { data: racquetData, error: racquetError } = await supabase
      .from('racquets')
      .select('brand, model')
      .eq('id', jobData.racquet_id)
      .single();

    if (racquetError) throw racquetError;

    // Get main string name
    const { data: mainStringData, error: stringError } = await supabase
      .from('strings')
      .select('name')
      .eq('id', jobData.string_id)
      .single();

    if (stringError) throw stringError;

    // Get cross string name (if different)
    let crossStringName = mainStringData.name;
    if (jobData.cross_string_id && jobData.cross_string_id !== jobData.string_id) {
      const { data: crossStringData, error: crossStringError } = await supabase
        .from('strings')
        .select('name')
        .eq('id', jobData.cross_string_id)
        .single();

      if (crossStringError) throw crossStringError;
      crossStringName = crossStringData.name;
    }

    // Insert the job
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          user_id: user.id,
          client_id: jobData.client_id,
          client_name: clientData.full_name,
          racquet_id: jobData.racquet_id,
          racquet_name: `${racquetData.brand} ${racquetData.model}`,
          string_id: jobData.string_id,
          string_name: mainStringData.name,
          cross_string_id: jobData.cross_string_id || jobData.string_id,
          cross_string_name: crossStringName,
          tension_main: parseFloat(jobData.tension_main),
          tension_cross: parseFloat(jobData.tension_cross),
          price: parseFloat(jobData.price),
          notes: jobData.notes || '',
          status: 'pending' as JobStatus,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update the racquet's last_stringing_date
    await supabase
      .from('racquets')
      .update({ last_stringing_date: new Date().toISOString() })
      .eq('id', jobData.racquet_id);

    return { data, error: null };
  } catch (error) {
    console.error('Error creating job:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to create job') 
    };
  }
};

export const getJobs = async (status?: JobStatus) => {
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to fetch jobs') 
    };
  }
};

export const updateJobStatus = async (jobId: string, status: JobStatus) => {
  try {
    const updates: Partial<Job> = { status };
    
    // If marking as completed, set completed_at
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    // If marking as picked up, set picked_up_at
    if (status === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating job status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to update job status') 
    };
  }
};
