import { createBox } from "@dessert-box/react";
import { ComponentProps } from "react";

import { atoms } from "../atoms.css";

export const Box = createBox({ atoms });
export type BoxProps = ComponentProps<typeof Box>;
