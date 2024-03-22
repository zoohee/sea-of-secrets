package com.ssafy.sos.nft.controller;

import com.ssafy.sos.member.domain.CustomOAuth2User;
import com.ssafy.sos.member.domain.UserDTO;
import com.ssafy.sos.member.domain.UserEntity;
import com.ssafy.sos.nft.domain.Wallet;
import com.ssafy.sos.nft.service.NFTService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Controller
@RequiredArgsConstructor
@RequestMapping("/nft")
public class NFTController {

    public final NFTService nftService;

    @GetMapping
    public String nft() {
        return "NFT";
    }

    @PostMapping("/wallet")
    @ResponseBody
    public ResponseEntity<?> makeWallet(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 해야함. 여길 어떻게 왔지?");
        }

        CustomOAuth2User user = (CustomOAuth2User) authentication.getPrincipal();

        Wallet wallet = nftService.makeWallet(user);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이미 지갑이 있습니다.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(wallet);
    }

    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<?> handleFileUpload(@RequestParam("file") MultipartFile file,
                                   @RequestParam("title") String title,
                                   @RequestParam("description") String description) {
        // 파일이 비어 있는지 확인
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }

        try {
            long fildId = nftService.saveFile(file, title, description);
            return ResponseEntity.status(HttpStatus.OK).body(fildId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(false);
        }
    }

    //TEST URL
    @PostMapping("/mint")
    @ResponseBody
    public ResponseEntity<?> mintNFT(Authentication authentication, @RequestParam("title") String title,
                          @RequestParam("description") String description) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 해야함. 여길 어떻게 왔지?");
        }

        CustomOAuth2User user = (CustomOAuth2User) authentication.getPrincipal();

        try {
            nftService.mintingNFT(user, title, description);
            return ResponseEntity.status(HttpStatus.OK).body("success");
        } catch(IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("success");
        }
    }

    @GetMapping("/qrcode")
    public String qrcode(Model model) {

        return "Klip";
    }

//    @PostMapping("/success")
//    @ResponseBody
//    public ResponseEntity<?> connectSuccess(@RequestBody Wallet wallet) {
//
//        return ResponseEntity.status(HttpStatus.OK).body(wallet);
//    }

}
