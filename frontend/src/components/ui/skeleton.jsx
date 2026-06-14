import { cn } from '../../lib/utils.js';

const Skeleton = ({ className, ...props }) => (
  <div className={cn('shimmer rounded-md', className)} {...props} />
);
export { Skeleton };
