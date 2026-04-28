import styled from 'styled-components/native';
import { SurfaceCard } from '@/shared/components/Layout';

/**
 * AnalyticsCard is a thin alias over {@link SurfaceCard} used as the base
 * surface for every tile on the Insights tab. Keeps the shadow / radius
 * tokens consistent with the rest of the app without duplicating styles.
 */
export const AnalyticsCard = styled(SurfaceCard)`
  padding: 0;
`;
