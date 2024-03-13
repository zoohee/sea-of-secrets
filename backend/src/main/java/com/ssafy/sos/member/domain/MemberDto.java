package com.ssafy.sos.member.domain;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MemberDto {
    private String nickname;
    private String picture;
    private String sub;

    private String role;
    private String name;
    private String username;
}
