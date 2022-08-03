import { themeClass } from "@/atoms.css";
import { PropsWithChildren, useState } from "react";

import { Box, BoxProps } from "./Box";

const Center = (props: BoxProps) => <Box display="flex" flexDirection="column" {...props} />;

// export const Demo123 = () => {
//     return (
//         <Center className={themeClass} flexDirection="column" height="100%">
//             <Center __margin="auto">
//                 <Box
//                     textAlign="center"
//                     __fontSize="50px"
//                     color={{ mobile: "blue100", tablet: "blue200", desktop: "yellow" }}
//                 >
//                     Ready to go
//                 </Box>
//             </Center>
//         </Center>
//     );
// };

export const Demo = () => {
    return (
        <Box
            className={themeClass}
            // textAlign="center"
            // __fontSize="50px"
            // color={{ mobile: "blue100", tablet: "blue200", desktop: "__orange" }}
            // color={{ mobile: "blue100", tablet: "blue200", desktop: "yellow" }}
            // _mobile={{ color: "red", __fontSize: "100px" }}
            // fontSize={{tablet: "medium"}}
            _mobile={{ color: "red", fontSize: "extraLarge" }}
            _tablet={{ color: "teal", fontSize: "medium" }}
            _desktop={{ color: "yellow", fontSize: "small" }}
        >
            Ready to go
        </Box>
    );
};
