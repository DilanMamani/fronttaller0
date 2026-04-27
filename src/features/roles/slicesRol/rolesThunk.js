import { createAsyncThunk } from '@reduxjs/toolkit';
import { rolesApi } from '../../../lib/api';

export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await rolesApi.fetchRoles(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchRolById = createAsyncThunk(
  'roles/fetchRolById',
  async (id, { rejectWithValue }) => {
    try {
      return await rolesApi.fetchRolById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createRol = createAsyncThunk(
  'roles/createRol',
  async (data, { rejectWithValue }) => {
    try {
      return await rolesApi.createRol(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateRol = createAsyncThunk(
  'roles/updateRol',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await rolesApi.updateRol(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);