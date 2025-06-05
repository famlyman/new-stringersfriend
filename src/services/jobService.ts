import { supabase } from '../lib/supabase';
import { Job, JobFormData, JobStatus } from '../types/job';
import { useAuth } from '../contexts/AuthContext';

export const createJob = async (jobData: JobFormData): Promise<{ data: Job | null; error: Error | null }> => {
  try {
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      throw new Error(sessionError?.message || 'User not authenticated');
    }

    // Get client name
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', jobData.client_id)
      .single();

    if (clientError) throw clientError;

    // Get racquet name with brand and model
    const { data: racquetData, error: racquetError } = await supabase
      .from('racquets')
      .select(`
        id,
        brand:brands!inner (
          id,
          name
        ),
        model:models!inner (
          id,
          name
        )
      `)
      .eq('id', jobData.racquet_id)
      .single();

    if (racquetError) throw racquetError;

    // Get main string details from string_inventory
    const { data: mainStringData, error: stringError } = await supabase
      .from('string_inventory')
      .select('*')
      .eq('id', jobData.string_id)
      .single();

    if (stringError) {
      console.error('Error fetching main string:', stringError);
      throw new Error('Failed to fetch main string details');
    }

    // Get cross string details (if different)
    let crossStringName = mainStringData?.string_name || 'Unknown';
    if (jobData.cross_string_id && jobData.cross_string_id !== jobData.string_id) {
      const { data: crossStringData, error: crossStringError } = await supabase
        .from('string_inventory')
        .select('*')
        .eq('id', jobData.cross_string_id)
        .single();

      if (crossStringError) {
        console.error('Error fetching cross string:', crossStringError);
        throw new Error('Failed to fetch cross string details');
      }
      crossStringName = crossStringData?.string_name || 'Unknown';
    }

    // Insert the job
    const { data, error } = await supabase
      .from('stringing_jobs')
      .insert([
        {
          user_id: session.user.id,
          stringer_id: session.user.id,
          client_id: jobData.client_id,
          racquet_id: jobData.racquet_id,
          string_id: jobData.string_id,
          cross_string_id: jobData.cross_string_id,
          tension_main: parseInt(jobData.tension_main),
          tension_cross: parseInt(jobData.tension_cross),
          status: 'pending',
          notes: jobData.notes || '',
          price: parseFloat(jobData.price),
          created_at: new Date().toISOString()
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
      query = query.eq('job_status', status);
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
    const updates: Partial<Job> = { job_status: status };
    
    // If marking as completed, set completed_date
    if (status === 'completed') {
      updates.completed_date = new Date().toISOString();
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
