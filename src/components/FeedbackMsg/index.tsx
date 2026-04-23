import { FeedbackMsgProps } from './types';

const FeedbackMsg: SafeFC<FeedbackMsgProps> = ({ error, success }) => {
  if (error) {
    return (
      <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
        {success}
      </p>
    );
  }
  return null;
};

export default FeedbackMsg;
