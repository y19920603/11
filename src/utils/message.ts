import { ElMessageBox } from "element-plus";

export function getDataErrorAlert(t: (key: string, arg?: any) => string, page_name: string) {
  ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t(`${page_name}`) })}`, {
    confirmButtonText: t("BUTTON_CONFIRM"),
    type: "error",
  });
}

export function actionErrorAlert(t: (key: string, arg?: any) => string, action_name: string) {
  ElMessageBox.alert(`${t("MSG_ACTION_FAIL_MESSAGE", { action: t(action_name) })}`, {
    confirmButtonText: t("BUTTON_CONFIRM"),
    type: "error",
  });
}

export function actionResultAlert(
  t: (key: string, arg?: any) => string,
  result: boolean,
  msg: string,
  action_name: string
) {
  ElMessageBox.alert(
    `${t(result ? "MSG_ACTION_SUCCESS_MESSAGE" : "MSG_ACTION_FAIL_MESSAGE", { action: t(action_name) })} ${result ? "" : `message: ${msg}`}`,
    {
      confirmButtonText: t("BUTTON_CONFIRM"),
      type: result ? "success" : "error",
    }
  );
}

export function errorAlert(t: (key: string, arg?: any) => string, msg: string) {
  ElMessageBox.alert(msg, {
    confirmButtonText: t("BUTTON_CONFIRM"),
    type: "error",
  });
}
