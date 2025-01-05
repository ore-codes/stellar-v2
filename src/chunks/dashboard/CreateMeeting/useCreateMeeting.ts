import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { apiClient } from '@/lib/api/axios.ts';
import { useApiRequest } from '@/lib/api/useApiRequest.ts';

import { createMeetingSchema } from './CreateMeeting.config.ts';
import { CreateMeetingRes } from './CreateMeeting.types.ts';

export default function useCreateMeeting() {
  const form = useForm({ resolver: yupResolver(createMeetingSchema) });
  const apiRequest = useApiRequest<CreateMeetingRes>();
  const [createdMeeting, setCreatedMeeting] = useState<CreateMeetingRes>();
  const meetingLink = window.location.origin + '/meeting/' + createdMeeting?.code;

  const handleSubmit = form.handleSubmit((data) => {
    apiRequest.makeRequest(apiClient.post('meetings', data)).subscribe(async (res) => {
      if (res) setCreatedMeeting(res);
    });
  });

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(meetingLink)
      .then(() => enqueueSnackbar('Link copied to clipboard', { variant: 'success' }))
      .catch(() => enqueueSnackbar('Link failed to copy', { variant: 'error' }));
  };

  return { form, handleSubmit, apiRequest, createdMeeting, handleCopyLink, meetingLink };
}
