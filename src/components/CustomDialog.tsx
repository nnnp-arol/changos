import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

type CustomDialogPropsType = {
  title?: string;
  open: boolean;
  handleClose?: () => void;
  children: JSX.Element;
  onConfirm?: () => void;
  titleConfirm?: string;
  titleCancel?: string;
  withBtns?: boolean;
};

export const CustomDialog: (props: CustomDialogPropsType) => JSX.Element = ({
  title,
  open,
  handleClose,
  children,
  onConfirm,
  titleConfirm,
  titleCancel,
  withBtns = true,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          className="text-center text-blue-400"
        >
          {title}
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        {withBtns ? (
          <DialogActions>
            <div className="flex w-full px-10 justify-between items-center py-5">
              <Button
                onClick={onConfirm}
                autoFocus
                color="primary"
                variant="contained"
              >
                {titleConfirm}
              </Button>
              <Button onClick={handleClose} color="primary" variant="outlined">
                {titleCancel}
              </Button>
            </div>
          </DialogActions>
        ) : null}
      </Dialog>
    </>
  );
};
